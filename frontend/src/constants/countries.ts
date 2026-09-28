export const countries = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
]

export function getCountryName(countryCode: string) {
  return countries.find(({ code }) => code === countryCode)?.name ?? countryCode
}
