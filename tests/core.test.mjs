import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const html = readFileSync('dist/screenshot-cleaner/index.html', 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function editor(check) {
  const nodes = new Map();
  const paintCalls = [];
  const ctx = {
    clearRect() {}, drawImage() {}, fillText() {}, strokeRect() {},
    fillRect(...coordinates) { paintCalls.push([this.fillStyle, ...coordinates]); }
  };
  const document = {
    getElementById(id) {
      if (!nodes.has(id)) nodes.set(id, {
        getContext: () => ctx, replaceChildren() {}, setAttribute() {},
        setPointerCapture() {}, getBoundingClientRect: () => ({left:0,top:0,width:800,height:450})
      });
      return nodes.get(id);
    },
    createElement() {
      return {
        getContext: () => ctx,
        toBlob(callback) { callback(new Blob(['123456789'])); }
      };
    }
  };
  return runInNewContext(script + '\n' + check, {
    document, Blob, TextEncoder, Option: function () {}, assert, paintCalls
  });
}

test('applies a cover across the sample batch, then undoes it on every image', () => {
  editor(`
    $('sample').onclick();
    $('batch').checked = true;
    const event = (x, y) => ({pointerId:1,button:0,clientX:x,clientY:y});
    canvas.onpointerdown(event(70,170));
    canvas.onpointerup(event(360,270));
    assert.equal(images.filter(image => image.masks.length===1).length, 3);
    assert.equal(JSON.stringify(paintCalls.at(-1)), JSON.stringify(['#171a22',70,170,290,100]));
    $('undo').onclick();
    assert.equal(images.filter(image => image.masks.length).length, 0);
  `);
});

test('crops only the selected image and translates cover coordinates for export', async () => {
  await editor(`
    $('sample').onclick();
    images[0].masks.push({x:25,y:30,w:50,h:60});
    $('crop').onclick();
    const event = (x,y) => ({pointerId:1,button:0,clientX:x,clientY:y});
    canvas.onpointerdown(event(15,20));
    canvas.onpointerup(event(415,220));
    assert.equal(canvas.width, 400);
    assert.equal(canvas.height, 200);
    assert.equal(images[1].crop, null);
    png(images[0]).then(() => {
      assert.equal(JSON.stringify(paintCalls.at(-1)), JSON.stringify(['#171a22',10,10,50,60]));
    });
  `);
});

test('writes three independent ZIP members with the correct names and checksum', async () => {
  const file = await editor("$('sample').onclick(); archive()");
  const bytes = Buffer.from(await file.arrayBuffer());
  let offset = 0;
  for (let i = 1; i <= 3; i++) {
    assert.equal(bytes.readUInt32LE(offset), 0x04034b50);
    assert.equal(bytes.readUInt32LE(offset+14), 0xcbf43926);
    const nameSize = bytes.readUInt16LE(offset+26);
    assert.equal(bytes.toString('utf8',offset+30,offset+30+nameSize), i+'-sample-'+i+'-cleaned.png');
    offset += 30+nameSize+9;
  }
  assert.equal(bytes.readUInt32LE(offset), 0x02014b50);
  assert.equal(bytes.readUInt16LE(bytes.length-12), 3);
  assert.equal(bytes.readUInt32LE(bytes.length-6), offset);
});
