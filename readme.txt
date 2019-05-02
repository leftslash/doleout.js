cookies:

store internally as object with multiple name/value pairs
convert to JSON, encrypt (AES), and base64 encode
store with proper domain, path settings
  use 1 hour expiry, maxage = 10000, name = session or id or something generic
