export const getImageUrl = (student) => {
  if (!student || !student.image) {
    return 'https://i.pravatar.cc/150'
  }

  let image = String(student.image).trim()

  // যদি full URL আসে, শুধু filename/path অংশ বের করবে
  if (image.startsWith('http://') || image.startsWith('https://')) {
    const storageIndex = image.indexOf('/storage/')

    if (storageIndex !== -1) {
      image = image.substring(storageIndex + '/storage/'.length)
    }
  }

  // public/ বা storage/ থাকলে remove করবে
  const cleanPath = image.replace(/^public\//, '').replace(/^storage\//, '')

  // Laravel API endpoint দিয়ে image serve হবে
  const filename = cleanPath.split('/').pop()

  return `http://localhost:8000/api/student-image/${filename}`
}
