import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || ''

const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder')

export async function POST(request: Request) {
  try {
    const { property_id, service_duration_minutes, team_size_required, date_start, date_end } = await request.json()

    // 1. Fetch details of the property we need to clean (to get its location)
    const { data: targetProperty, error: propErr } = await supabase
      .from('properties')
      .select('lat, lng')
      .eq('id', property_id)
      .single()

    if (propErr || !targetProperty) {
      return new Response(JSON.stringify({ error: 'Property not found' }), { status: 404 })
    }

    // 2. Fetch all employees who have capacity >= team_size_required
    const { data: employees } = await supabase
      .from('employees')
      .select('id, full_name, capacity_size')
      .gte('capacity_size', team_size_required)
      .eq('status', 'activo')

    if (!employees || employees.length === 0) {
      return new Response(JSON.stringify({ error: 'No crew with sufficient capacity available' }), { status: 400 })
    }

    // 3. For each suitable crew, check their shifts on that day
    const availableCrews = []

    for (const employee of employees) {
      // Get all shifts for this employee that overlap or are on the same day
      const { data: shifts } = await supabase
        .from('shifts')
        .select(`
          id, shift_start, shift_end,
          jobs (
            properties (
              lat, 
              lng
            )
          )
        `)
        .eq('employee_id', employee.id)
        .gte('shift_start', date_start.split('T')[0] + 'T00:00:00Z') // Same day
        .lte('shift_end', date_start.split('T')[0] + 'T23:59:59Z')

      
      // If the crew has no shifts, they are available (and windshield time is from HQ or 0)
      if (!shifts || shifts.length === 0) {
        availableCrews.push({
          employee_id: employee.id,
          employee_name: employee.full_name,
          travel_time_minutes: 0, 
          windshield_status: 'first_job'
        })
        continue
      }

      // Check double booking for the requested time window
      const requestedStart = new Date(date_start).getTime()
      const requestedEnd = new Date(date_end).getTime()
      let hasOverlap = false

      for (const shift of shifts) {
        const sStart = new Date(shift.shift_start).getTime()
        const sEnd = new Date(shift.shift_end).getTime()
        if (requestedStart < sEnd && requestedEnd > sStart) {
          hasOverlap = true
          break
        }
      }

      if (hasOverlap) continue // Prevents double booking

      // 4. Calculate Distance Matrix if there's a preceding or succeeding shift
      // Find the shift immediately before the requested slot to calculate travel time
      const precedingShift: any = shifts
        .filter(s => new Date(s.shift_end).getTime() <= requestedStart)
        .sort((a, b) => new Date(b.shift_end).getTime() - new Date(a.shift_end).getTime())[0]

      if (precedingShift && precedingShift.jobs && precedingShift.jobs.properties) {
        const prevLat = precedingShift.jobs.properties.lat
        const prevLng = precedingShift.jobs.properties.lng

        // Call Google Maps Distance Matrix API
        const origin = `${prevLat},${prevLng}`
        const destination = `${targetProperty.lat},${targetProperty.lng}`
        const mapsReq = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${googleMapsApiKey}`)
        const mapsData = await mapsReq.json()

        let travelDurationMinutes = 30 // Fallback assuming 30 min max in Punta del Este
        if (mapsData.rows?.[0]?.elements?.[0]?.status === 'OK') {
          const durationSeconds = mapsData.rows[0].elements[0].duration.value
          travelDurationMinutes = Math.ceil(durationSeconds / 60)
        }

        // Validate windshield time constraint:
        // Turno A (fin) + windshield_time <= Turno B (inicio)
        const gapMinutes = (requestedStart - new Date(precedingShift.shift_end).getTime()) / 60000

        if (gapMinutes >= travelDurationMinutes) {
          // It's a valid geographical grouping!
          availableCrews.push({
            employee_id: employee.id,
            employee_name: employee.full_name,
            travel_time_minutes: travelDurationMinutes,
            windshield_status: 'optimal_routing' // Helps us sort the best crew
          })
        }
      } else {
        // Gap is valid but no directly preceding shift with location
        availableCrews.push({
          employee_id: employee.id,
          employee_name: employee.full_name,
          travel_time_minutes: 0,
          windshield_status: 'isolated_job'
        })
      }
    }

    // Sort by optimal routing (least travel time first, grouping them together)
    availableCrews.sort((a, b) => a.travel_time_minutes - b.travel_time_minutes)

    return new Response(JSON.stringify({ availableCrews }), { status: 200 })

  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
