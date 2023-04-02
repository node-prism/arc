/*

   This is a mashup of github.com/lukeed/hexoid and github.com/paralleldrive/cuid
   Both are MIT licensed.

 ~ https://github.com/paralleldrive/cuid/blob/f507d971a70da224d3eb447ed87ddbeb1b9fd097/LICENSE
   --
   MIT License
   Copyright (c) 2012 Eric Elliott
   Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
   The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 ~ https://github.com/lukeed/hexoid/blob/1070447cdc62d1780d2a657b0df64348fc1e5ec5/license
   --
   MIT License
   Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
   Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
   The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

const HEX: string[] = [];

for (let i = 0; i < 256; i++) {
  HEX[i] = (i + 256).toString(16).substring(1);
}

function pad(str: string, size: number) {
  const s = "000000" + str;
  return s.substring(s.length - size);
}

const SHARD_COUNT = 32;

export function getCreateId(opts: { init: number; len: number }) {
  const len = opts.len || 16;
  let str = "";
  let num = 0;
  const discreteValues = 1_679_616; // Math.pow(36, 4)
  let current = opts.init + Math.ceil(discreteValues / 2);

  function counter() {
    current = current <= discreteValues ? current : 0;
    current++;
    return (current - 1).toString(16);
  }

  return () => {
    if (!str || num === 256) {
      str = "";
      num = ((1 + len) / 2) | 0;
      while (num--) str += HEX[(256 * Math.random()) | 0];
      str = str.substring((num = 0), len);
    }

    const date = Date.now().toString(36);
    const paddedCounter = pad(counter(), 6);
    const hex = HEX[num++];

    const shardKey = parseInt(hex, 16) % SHARD_COUNT;

    return `a${date}${paddedCounter}${hex}${str}${shardKey}`;
  };
}
