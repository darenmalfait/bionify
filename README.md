# `bionify`

## Install

```
npm install bionify
```

## Usage

```js
function ModalDemo() {
  const [bionified, setBionified] = React.useState(true)
  
  const text = '<p>Bionic Reading is a new method facilitating the reading process by guiding the eyes through text with artificial fixation points. As a result, the reader is only focusing on the highlighted initial letters and lets the brain center complete the word. In a digital world dominated by shallow forms of reading, Bionic Reading aims to encourage a more in-depth reading and understanding of written content.</p><h2>title in the meantime</h2><p>Bionic Reading is a new method facilitating the reading process by guiding the eyes through text with artificial fixation points. As a result, the reader is only focusing on the highlighted initial letters and lets the brain center complete the word. In a digital world dominated by shallow forms of reading, Bionic Reading aims to encourage a more in-depth reading and understanding of written content.</p>';

  const html = bionified ? bionify(text) : text;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center space-x-4">
        <span>Bionified</span>
        <Toggle onChange={(checked) => setBionified(checked)} value={bionified} />
      </div>
      <div className="prose" dangerouslySetInnerHTML={{__html: html }} />
    </div>
  )
}
```

