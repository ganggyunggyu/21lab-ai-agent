export const formatMessage = (text:string) => {
  if (!text) return ''
  return text.replace(/\n/g, '<br/>')
}
