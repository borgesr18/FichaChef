export function convertFormDataToNumbers(formData: Record<string, unknown>, numericFields: string[]): Record<string, unknown> {
  const converted = { ...formData }
  
  numericFields.forEach(field => {
    if (converted[field] !== undefined && converted[field] !== '') {
      const numValue = parseFloat(String(converted[field]))
      if (!isNaN(numValue)) {
        converted[field] = numValue
      }
    }
  })
  
  return converted
}
