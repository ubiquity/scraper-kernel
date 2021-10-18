// It will name the function whatever you want, dynamically and the function name can be seen in the stack trace

export function dynamicallyNameFunction(name: string, functionToDynamicallyName: () => any) {
  return {
    [name]: functionToDynamicallyName(),
  }[name];
}
