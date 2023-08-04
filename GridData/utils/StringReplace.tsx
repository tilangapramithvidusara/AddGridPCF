
export const stringReplace = (text: string, number1: number, number2?: number): string => {
  let replacedText: string;
  if (number2 !== undefined) {
    replacedText = text.replace(/\$\$/g, number2?.toString());
  } else {
    replacedText = text;
  }
  replacedText = replacedText.replace(/\$/g, number1?.toString());
  return replacedText;
}