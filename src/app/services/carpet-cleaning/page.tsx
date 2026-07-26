'use client'

import { ServiceEstimateForm } from '@/components/services/ServiceEstimateForm'
import { getService } from '@/content/services'

export default function CarpetCleaningPage() {
  return <ServiceEstimateForm service={getService('carpet-cleaning')} />
}
