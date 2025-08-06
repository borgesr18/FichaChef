export function convertFormDataToNumbers(formData: Record<string, unknown>, numericFields: string[]): Record<string, unknown> {
  const converted = { ...formData }
  
  numericFields.forEach(field => {
    if (converted[field] !== undefined && converted[field] !== '' && converted[field] !== null) {
      const numValue = parseFloat(String(converted[field]))
      if (!isNaN(numValue) && numValue > 0) {
        converted[field] = numValue
      } else {
        delete converted[field]
      }
    } else {
      delete converted[field]
    }
  })
  
  return converted
}

export function convertFormDataToDates(formData: Record<string, unknown>, dateFields: string[]): Record<string, unknown> {
  const converted = { ...formData }
  
  dateFields.forEach(field => {
    if (converted[field] !== undefined && converted[field] !== '') {
      const dateValue = new Date(String(converted[field]))
      if (!isNaN(dateValue.getTime())) {
        converted[field] = dateValue
      }
    }
  })
  
  return converted
}
