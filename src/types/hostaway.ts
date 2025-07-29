export interface Listing {
  id: number;
  propertyTypeId: number;
  name: string;
  externalId?: string;
  internalId?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  country?: string;
  price?: number;
  personCapacity?: number;
  bedroomsNumber?: number;
  bathroomsNumber?: number;
  thumbnailUrl?: string;
  starRating?: number;
  averageReviewRating?: number;
  address?: string;
  zipcode?: string;
  cleaningFee?: number;
  minNights?: number;
  maxNights?: number;
  checkInTimeStart?: number;
  checkOutTime?: number;
  instantBookable?: number;
  contactName?: string;
  contactEmail?: string;
  contactPhone1?: string;
  listingAmenities?: ListingAmenity[];
  listingImages?: ListingImage[];
  currency?: string;
  bedsNumber?: number;
  houseRules?: string;
  checkInTimeEnd?: number;
  taxRate?: number;
}

export interface ListingAmenity {
  id: number;
  amenityId: number;
  amenityName: string;
  amenityCategoryName?: string;
}

export interface ListingImage {
  id: number;
  caption: string;
  url: string;
  sortOrder?: number;
}

export interface CalendarDay {
  date: string;
  status: 'available' | 'booked' | 'blocked';
  price?: number;
  minimumNights?: number;
  changeover?: number;
  availableUnits?: number;
}

export interface Review {
  id: number;
  listingId: number;
  rating: number;
  comment: string;
  guestName: string;
  createdAt: string;
  response?: string;
}

export interface ListingsQueryParams {
  limit?: number;
  offset?: number;
  sortOrder?: string;
  city?: string;
  match?: string;
  country?: string;
  propertyTypeId?: number;
  availabilityDateStart?: string;
  availabilityDateEnd?: string;
  availabilityGuestNumber?: number;
  isBookingEngineActive?: boolean;
}

export interface HostawayResponse<T> {
  status: string;
  result: T;
}