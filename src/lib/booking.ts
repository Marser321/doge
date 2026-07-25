export type BookingFields = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  property_type: string;
  service_type: string;
  consent: boolean;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateBookingFields(input: BookingFields) {
  if (!input.name.trim()) return 'Completa tu nombre.';
  if (!emailPattern.test(input.email.trim())) return 'Ingresa un email válido.';
  if (!input.phone.trim()) return 'Completa tu teléfono.';
  if (!input.address.trim() || !input.city.trim()) return 'Completa la dirección y la ciudad.';
  if (!input.property_type.trim() || !input.service_type.trim()) return 'Selecciona la propiedad y el servicio.';
  if (!input.consent) return 'Debes autorizar el uso de los datos para gestionar la solicitud.';
  return null;
}
