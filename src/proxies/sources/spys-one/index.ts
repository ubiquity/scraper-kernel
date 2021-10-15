import fetchSpysOne from "./fetch-spys-one";
export default async () => {
  const response = await fetchSpysOne();

  //   .then((response) => {
  const ips = getIpAddressesWithPortNumber(response);
  return ips;
  //   console.log(ips);
  //   });
};

function getIpAddressesWithPortNumber(response: string) {
  const ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}/g;
  return response.match(ipRegex);
}

// function getIpAddresses(response: string) {
//   const ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g;
//   return response.match(ipRegex);
// }

// function getUrls(response: string) {
//   const regex = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
//   const urls = response.match(regex);
//   return urls;
// }
