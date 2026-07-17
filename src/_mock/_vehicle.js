// Matches backend enum `VehicleClass` (rental_core.vehicle.vehicle_class)
export const VEHICLE_CLASS_OPTIONS = [
  { value: 'car', label: 'Car' },
  { value: 'suv', label: 'SUV' },
  { value: 'van', label: 'Van' },
  { value: 'bus', label: 'Bus' },
  { value: 'truck', label: 'Truck' },
  { value: 'lorry', label: 'Lorry' },
  { value: 'bike', label: 'Bike' },
  { value: 'tuktuk', label: 'Tuk Tuk' },
];

// Vehicle classes that carry cargo instead of (or in addition to) passengers
export const CARGO_VEHICLE_CLASSES = ['van', 'truck', 'lorry'];

// Matches backend enum `VehicleStatus` (rental_core.vehicle.status)
export const VEHICLE_STATUS_OPTIONS = [
  { value: 'available', label: 'Available', color: 'success' },
  { value: 'reserved', label: 'Reserved', color: 'info' },
  { value: 'rented', label: 'Rented', color: 'warning' },
  { value: 'maintenance', label: 'Maintenance', color: 'error' },
  { value: 'retired', label: 'Retired', color: 'default' },
];

export const VEHICLE_STATUSES = VEHICLE_STATUS_OPTIONS.map((option) => option.value);

// `fuel_type` / `transmission` are free-text columns on the backend; these are just
// the common values offered in the UI, the field still accepts custom values.
export const FUEL_TYPE_OPTIONS = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'electric', label: 'Electric' },
  { value: 'cng', label: 'CNG' },
];

export const TRANSMISSION_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
];

export const VEHICLE_MAKES = [
  'Toyota',
  'Honda',
  'BMW',
  'Mercedes',
  'Suzuki',
  'Nissan',
  'Hyundai',
  'Mitsubishi',
  'Isuzu',
  'Ford',
  'Kia',
];
