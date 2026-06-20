// 사진 파일을 캔버스로 리사이즈/압축해 JPEG data URL로 변환합니다.
// - 사용자가 큰 사진(수 MB, 폰 카메라 원본)을 넣어도 앱이 알아서 목표 용량 이하로 줄입니다.
//   (사용자가 다른 앱에서 용량을 줄일 필요가 전혀 없습니다.)
// - 목표 용량을 넘으면 화질→해상도 순으로 자동으로 더 압축합니다.
// - 디코딩/캔버스 실패(예: 데스크톱 브라우저의 일부 HEIC) 시 원본 data URL을 그대로 반환합니다.

function render(img: HTMLImageElement, maxSize: number, quality: number): string | null {
  let { width, height } = img
  if (width > maxSize || height > maxSize) {
    if (width >= height) {
      height = Math.round((height * maxSize) / width)
      width = maxSize
    } else {
      width = Math.round((width * maxSize) / height)
      height = maxSize
    }
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', quality)
}

export async function fileToCompressedDataUrl(
  file: File,
  maxSize = 1280,
  quality = 0.8,
  // data URL 문자열 목표 길이(약 0.9MB 이미지). 이 이하가 될 때까지 자동으로 더 압축.
  targetChars = 1_200_000
): Promise<string> {
  const originalDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다'))
    reader.readAsDataURL(file)
  })

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('이미지를 디코딩할 수 없습니다'))
      image.src = originalDataUrl
    })

    let dims = maxSize
    let q = quality
    let out = render(img, dims, q)
    if (!out) return originalDataUrl

    // 목표 용량을 넘으면: 먼저 화질을 낮추고, 더 필요하면 해상도를 줄여가며 반복.
    let guard = 0
    while (out.length > targetChars && guard < 8) {
      if (q > 0.45) {
        q = Math.max(0.4, q - 0.15)
      } else {
        dims = Math.round(dims * 0.8)
        q = 0.6
        if (dims < 640) break
      }
      const next = render(img, dims, q)
      if (!next) break
      out = next
      guard += 1
    }
    return out
  } catch {
    // 디코딩 실패(예: 일부 HEIC) 시 원본을 그대로 사용
    return originalDataUrl
  }
}
