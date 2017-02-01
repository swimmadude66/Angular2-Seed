#Angular2+ Seed

_Sturdy starting point with my favorite tech stack_

##Tools
- Angular 2+
- ExpressJs (Ts now?)
- dotenv
- Typescript
- Gulp for task running
- Browserify for bundling
- BrowserSync for auto reloads  
- Npm for package dependency
- Bootstrap 4 for css framework
- SCSS for stylesheets
- FontAwesome for icons

The API is a basic ExpressJS api with a sample division of routes. Code is in Typescript, and the build process compiles it to js. And that's all for now.
Not a lot of magic here. Exception is `dotenv` which allows you to place a `.env` file in the root of the project to override any of the environment variables!


The frontend uses an alternative folder organization stragegy that requires some trickery for nice builds. Since the templates and styles are included alongside the component 
we have to inject them in to the component at build time. This means one extra step in the build but has some benefits. Most importantly, its a lot easier to get an idea of grouped 
components. Since you can nest the folders to represent the navigation of your app, you no longer have to search a flat list of template or component files for all the 
files associated with a given view. Less important, but still nice, is that we can easily use non-css and non-html files for __some__ components. Great if you are evaluating 
a new technology like sass or less, and are not ready for a full app rewrite yet.

To do the injection, this project uses a Browserify transform called loaderify, which I wrote for another project. loaderify treats browserify require chains like webpack would, 
allowing you to specify functions to be performed against required files matching certain patterns. By default, this project injects all css and html, and compiles and inserts all scss. 


##Get started
To get started, run `npm i && npm run gulp`. When the build completes, run `npm start` and load up `localhost:3000` to see the sample app!

###BrowserSync
If you run `npm gulp -- watch` (mind the spaces) it will launch watchify with browserSync. Run `npm start` in another terminal, then refresh the browser window that opened up. 
You will have an auto-reloading browser session which re-compiles on file changes!