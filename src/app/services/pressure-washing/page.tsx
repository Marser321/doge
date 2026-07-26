'use client'

import { ServiceEstimateForm } from '@/components/services/ServiceEstimateForm'
import { getService } from '@/content/services'

export default function PressureWashingPage() {
  return <ServiceEstimateForm service={getService('pressure-washing')} />
}
