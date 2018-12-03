const puppeteer = require('puppeteer');

(async () => {

    const browser = await puppeteer.launch({
        args: ['--disable-features=site-per-process'],
    });
    const page = await browser.newPage();
// Adjustments particular to this page to ensure we hit desktop breakpoint.
    page.setViewport({width: 1000, height: 600, deviceScaleFactor: 1});

    await page.goto('https://pitchfork.com/', {waitUntil: 'networkidle2'});

    /**
     * Takes a screenshot of a DOM element on the page, with optional padding.
     *
     * @param {!{path:string, selector:string, padding:(number|undefined)}=} opts
     * @return {!Promise<!Buffer>}
     */
    async function screenshotDOMElement(opts = {}) {
        const padding = 'padding' in opts ? opts.padding : 0;
        const path = 'path' in opts ? opts.path : null;
        const selector = opts.selector;

        if (!selector)
            throw Error('Please provide a selector.');

        const elementHandler = (await page.$x(selector))[0];
        if (!elementHandler) {
            throw Error(`Could not find element that matches selector: ${selector}.`);
        }

        const rect = await page.evaluate(element => {            
            if (!element)
                return null;
            const {x, y, width, height} = element.getBoundingClientRect();
            return {left: x, top: y, width, height, id: element.id};
        }, elementHandler);
        
        return await page.screenshot({
            path,
            clip: {
                x: rect.left - padding,
                y: rect.top - padding,
                width: rect.width + padding * 2,
                height: rect.height + padding * 2
            }
        });
    }
    
    // sample for a minute
    for (var i=0; i<5; i++) {
        await page.waitFor(10000*i);
        await page.screenshot({path: 'fullpage_'+i+'.png', fullPage: true});
        await screenshotDOMElement({
            path: 'element'+i+'.png',
            selector: '//*[@id="google_ads_iframe_3379/conde.pitchfork/rail/homepage/bundle/1_0__container__"]', // *[@id="sb_rel_my-adsMAST-iframe"]
            padding: 16
        });

    }
    
    browser.close();
})();
