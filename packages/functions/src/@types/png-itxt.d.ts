declare module "png-itxt" {
  function set(data: data, replaceAll: boolean): any;

  interface data {
    keyword: string;
    value: string;
  }
}
