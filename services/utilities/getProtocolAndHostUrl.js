export default function getProtocolAndHostUrl(request) {
  return `${request.protocol}://${request.get("Host")}`;
}
