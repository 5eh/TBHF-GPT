declare module "use-react-countries" {
  interface Country {
    id: string;
    name: string;
  }

  export function useCountries(): { countries: Country[] };
}
