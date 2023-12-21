interface DataObject {
  propid: number;
  link: string;
  address: string;
  city: string;
  district: string;
  historicalDistrict: string;
  metro: string;
  street: string;
  houseNumber: string;
  description: string;
  footMetro: number;
  carMetro: number;
  price: number;
  dateposted: Date;
  ownerID: number;
  phone: string;
  housingType: string;
  totalArea: number;
  livingArea: number;
  kitchenArea: number;
  ceilingHeight: number;
  bathroom: string;
  balcony: boolean;
  viewFromWindows: string;
  renovation: string;
  year: number;
  buildingSeries: string;
  elevatorCount: number;
  buildingType: string;
  overlapType: string;
  parking: string;
  entrances: number;
  heating: string;
  emergency: boolean;
  floor: number;
  totalFloors: number;
  cianPrice: number;
  rooms: number;
  pricePerMeter: number;
  lat: number;
  lng: number;
  isByOwner: boolean;
  updated: Date;
  scrapedAt: Date;
  serviceName: string;
}

const MONTHS = {
  янв: '01',
  фев: '02',
  мар: '03',
  апр: '04',
  май: '05',
  июн: '06',
  июл: '07',
  авг: '08',
  сен: '09',
  окт: '10',
  ноя: '11',
  дек: '12',
};

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36';

export { MONTHS, USER_AGENT, DataObject };
