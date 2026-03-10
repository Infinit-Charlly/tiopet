import type { City, TransportType } from "./types";

const CITY_SURCHARGES: Record<City, number> = {
  Latacunga: 0,
  Quito: 1,
  "Porto Viejo": 1,
};

const TRANSPORT_SURCHARGES: Record<TransportType, number> = {
  ida: 2,
  vuelta: 2,
  ida_vuelta: 4,
};

const VET_CHECK_PRICE = 8;

function getSurcharge<T extends string>(
  surcharges: Record<T, number>,
  value: string | null | undefined
) {
  return typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(surcharges, value)
    ? surcharges[value as T]
    : 0;
}

export function moneyUSD(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function calculateBookingTotal({
  basePrice,
  city,
  vetCheck,
  transportNeeded,
  transportType,
}: {
  basePrice: number;
  city: City;
  vetCheck: boolean;
  transportNeeded: boolean;
  transportType: TransportType;
}) {
  const cityAdj = getSurcharge(CITY_SURCHARGES, city);
  const vetAdj = vetCheck ? VET_CHECK_PRICE : 0;
  const transportAdj = transportNeeded
    ? getSurcharge(TRANSPORT_SURCHARGES, transportType)
    : 0;

  return basePrice + cityAdj + vetAdj + transportAdj;
}
