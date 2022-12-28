window.Slight = {
    // Necessary directives for slight.
    directives : {
        'x-text' : ( element, value ) => {
            element.innerText = value;
        },
        'x-show' : ( element, value ) => {
            element.style.display = Boolean( value ) ? 'block' : 'none';
        }
    },

    // Initialize slight JS.
    start() {
        this.root    = document.querySelector( '[x-data]' );
        this.rawData = this.getInitialDataValue();
        this.dataObj = this.observe( this.rawData );

        this.registerListener();
        this.reFreshDom();
    },

    // Process slight state as actual data types.
    getInitialDataValue() {
        const dataStringValue = this.root.getAttribute( 'x-data' );
        return eval(`(${dataStringValue})`);
    },

    // Make slight reactive.
    observe( data ) {
        const self = this;
        return new Proxy( data, {
            set( target, key, value ) {
                target[ key ] = value;

                self.reFreshDom();
            }
        });
    },

    // Go throw check all DOM's.
    walkDom( element, callback ) {
        callback( element );

        element = element.firstElementChild;

        while( element ) {
            this.walkDom( element, callback );
            element = element.nextElementSibling;
        }
    },

    // Registered slight event listeners.
    registerListener() {
        this.walkDom( this.root, element => {
            Array.from( element.attributes ).forEach( attr => {
                if ( ! attr.name.startsWith( '@' ) ) return;

                const event = attr.name.replace( '@', '' );
                element.addEventListener( event, () => eval( `with( this.dataObj ) { (${attr.value}) }` ) );
            });
        });
    },

    // Re-fresh slight DOM's.
    reFreshDom() {
        this.walkDom( this.root, element => {
            Array.from( element.attributes ).forEach( attr => {
                if ( ! Object.keys( this.directives ).includes( attr.name ) ) return;

                this.directives[attr.name]( element, eval( `with( this.dataObj ) { (${attr.value}) }` ) );
            });
        });
    },
};

// Kick off slight JS.
window.Slight.start();