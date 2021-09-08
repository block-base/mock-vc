/* eslint-disable  @typescript-eslint/no-explicit-any */
declare module "png-itxt" {
  function set(data: data, replaceAll: boolean): any;
  function set(input: string, data: data, callback?: callback): any;

  function get(keyword?: string, filters?: string | void | callback, callback?: callback): any;

  interface callback {
    (err: any, data: any): void;
  }

  interface data {
    keyword: string;
    value: string;
  }
}
