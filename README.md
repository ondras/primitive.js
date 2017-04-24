# primitive.js

A JavaScript re-creation of the [primitive.lol](http://primitive.lol/) application.

## How does it look?

Check out the [Masterpieces](https://cielitolindo.de/albums/masterpieces/) gallery for several cool samples.

## Try it now!

[At a dedicated demo page](https://ondras.github.io/primitive.js/)

## Building

Written in client-side JavaScript, uses Rollup for JS bundling and LESS for CSS pre-processing.

  1. `git clone git@github.com:ondras/primitive.js.git`
  1. `npm install`
  1. `npm start`

## About the algorithm

Most of the ideas are shared with the original app, described at https://github.com/fogleman/primitive/. Rasterization is done via HTML5 <canvas>, which is very flexible but prohibits reasonable parallelization. Web Worker support is [available](js/src/workerPool.js) but not used at all, as it does not currently bring any performance improvement. This might change in the future.

## License

[MIT](license.txt)

## Contributing

There are no major missing features nor a roadmap. The UI needs some polishing w.r.t. UX. If you think your feature/bugfix/contribution might be worthwhile, please ask before diving into the code. Performance improvements (measurable) are welcome. 
