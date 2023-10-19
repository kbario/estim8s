const whitelist = ['kylebario1@gmail.com']
export const validateEmail = (email: string) => {
  return email.match(/.*@imdexlimited\.com/gm) || whitelist.includes(email)
}

