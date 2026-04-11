import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type DispatchMode = "mock" | "live";
type WindshieldStatus = "first_job" | "availability_checked";

type AvailabilityPayload = {
  property_id: string;
  team_size_required: number;
  date_start: string;
  date_end: string;
  service_duration_minutes?: number;
};

type CrewCandidate = {
  employee_id: string;
  employee_name: string;
  travel_time_minutes: number;
  windshield_status: WindshieldStatus;
};

type PropertyCoordinates = {
  lat: number | null;
  lng: number | null;
};

type Employee = {
  id: string;
  full_name: string;
  capacity_size: number | null;
};

type Shift = {
  id: string;
  shift_start: string;
  shift_end: string;
};

const dispatchMode: DispatchMode =
  process.env.DISPATCH_MODE === "live" ? "live" : "mock";

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

function parsePayload(input: unknown): { data?: AvailabilityPayload; errors: string[] } {
  if (!input || typeof input !== "object") {
    return { errors: ["Request body must be a JSON object"] };
  }

  const raw = input as Record<string, unknown>;
  const propertyId = raw.property_id;
  const teamSize = raw.team_size_required;
  const dateStart = raw.date_start;
  const dateEnd = raw.date_end;
  const serviceDuration = raw.service_duration_minutes;

  const errors: string[] = [];

  if (typeof propertyId !== "string" || propertyId.trim().length === 0) {
    errors.push("property_id is required and must be a non-empty string");
  }

  if (typeof teamSize !== "number" || !Number.isInteger(teamSize) || teamSize <= 0) {
    errors.push("team_size_required must be a positive integer");
  }

  if (typeof dateStart !== "string" || Number.isNaN(Date.parse(dateStart))) {
    errors.push("date_start must be a valid ISO date string");
  }

  if (typeof dateEnd !== "string" || Number.isNaN(Date.parse(dateEnd))) {
    errors.push("date_end must be a valid ISO date string");
  }

  if (
    typeof serviceDuration !== "undefined" &&
    (typeof serviceDuration !== "number" ||
      !Number.isInteger(serviceDuration) ||
      serviceDuration <= 0)
  ) {
    errors.push("service_duration_minutes must be a positive integer when provided");
  }

  if (
    typeof dateStart === "string" &&
    typeof dateEnd === "string" &&
    !Number.isNaN(Date.parse(dateStart)) &&
    !Number.isNaN(Date.parse(dateEnd))
  ) {
    const start = new Date(dateStart).getTime();
    const end = new Date(dateEnd).getTime();
    if (end <= start) {
      errors.push("date_end must be greater than date_start");
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  const propertyIdSafe = propertyId as string;
  const teamSizeSafe = teamSize as number;
  const dateStartSafe = dateStart as string;
  const dateEndSafe = dateEnd as string;

  return {
    errors: [],
    data: {
      property_id: propertyIdSafe.trim(),
      team_size_required: teamSizeSafe,
      date_start: dateStartSafe,
      date_end: dateEndSafe,
      service_duration_minutes:
        typeof serviceDuration === "number" ? serviceDuration : undefined,
    },
  };
}

function buildMockAvailability(payload: AvailabilityPayload): CrewCandidate[] {
  const hourSeed = new Date(payload.date_start).getUTCHours();
  const capacitySeed = payload.team_size_required;

  const crews: CrewCandidate[] = [
    {
      employee_id: "mock-alpha",
      employee_name: "Equipo Alpha",
      travel_time_minutes: Math.max(8, 12 + capacitySeed - (hourSeed % 3)),
      windshield_status: "availability_checked",
    },
    {
      employee_id: "mock-bravo",
      employee_name: "Equipo Bravo",
      travel_time_minutes: Math.max(10, 16 + (hourSeed % 5)),
      windshield_status: "availability_checked",
    },
    {
      employee_id: "mock-charlie",
      employee_name: "Equipo Charlie",
      travel_time_minutes: 0,
      windshield_status: "first_job",
    },
  ];

  return crews.sort((a, b) => a.travel_time_minutes - b.travel_time_minutes);
}

function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Dispatch live mode is missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function fetchLiveAvailability(payload: AvailabilityPayload): Promise<CrewCandidate[]> {
  const supabase = getSupabaseClient();

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("lat, lng")
    .eq("id", payload.property_id)
    .single<PropertyCoordinates>();

  if (propertyError || !property) {
    throw new Error("Property not found");
  }

  const { data: employees, error: employeeError } = await supabase
    .from("employees")
    .select("id, full_name, capacity_size")
    .eq("status", "activo")
    .gte("capacity_size", payload.team_size_required)
    .returns<Employee[]>();

  if (employeeError) {
    throw new Error("Failed to fetch employees");
  }

  if (!employees || employees.length === 0) {
    return [];
  }

  const day = payload.date_start.split("T")[0];
  const dayStart = `${day}T00:00:00Z`;
  const dayEnd = `${day}T23:59:59Z`;
  const requestedStart = new Date(payload.date_start).getTime();
  const requestedEnd = new Date(payload.date_end).getTime();

  const available: CrewCandidate[] = [];

  for (const employee of employees) {
    const { data: shifts, error: shiftError } = await supabase
      .from("shifts")
      .select("id, shift_start, shift_end")
      .eq("employee_id", employee.id)
      .gte("shift_start", dayStart)
      .lte("shift_end", dayEnd)
      .returns<Shift[]>();

    if (shiftError) {
      continue;
    }

    const hasOverlap =
      shifts?.some((shift) => {
        const shiftStart = new Date(shift.shift_start).getTime();
        const shiftEnd = new Date(shift.shift_end).getTime();
        return requestedStart < shiftEnd && requestedEnd > shiftStart;
      }) ?? false;

    if (hasOverlap) {
      continue;
    }

    available.push({
      employee_id: employee.id,
      employee_name: employee.full_name,
      travel_time_minutes: 0,
      windshield_status:
        property.lat !== null && property.lng !== null
          ? "availability_checked"
          : "first_job",
    });
  }

  return available.sort((a, b) => a.travel_time_minutes - b.travel_time_minutes);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const parsed = parsePayload(body);

    if (!parsed.data) {
      return json({ error: "Invalid request payload", details: parsed.errors }, 400);
    }

    if (dispatchMode === "mock") {
      return json({
        mode: "mock",
        availableCrews: buildMockAvailability(parsed.data),
      });
    }

    const availableCrews = await fetchLiveAvailability(parsed.data);

    if (availableCrews.length === 0) {
      return json(
        { error: "No crew with sufficient capacity available" },
        404,
      );
    }

    return json({ mode: "live", availableCrews });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected dispatch error";

    if (
      message === "Property not found" ||
      message.includes("Invalid request payload")
    ) {
      return json({ error: message }, 400);
    }

    if (message.includes("missing Supabase")) {
      return json(
        {
          error:
            "Dispatch service is unavailable. Configure DISPATCH_MODE=mock or provide live credentials.",
        },
        503,
      );
    }

    return json({ error: "Internal dispatch service error" }, 500);
  }
}
