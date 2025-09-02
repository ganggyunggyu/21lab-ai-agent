

export const downloadText = ({content, fileName}: {content: string, fileName: string}) => {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  
  a.href = url

  a.download = `${fileName}.txt`; 
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
}