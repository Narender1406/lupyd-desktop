export function initKeyboardHandler() {
    if (typeof window === 'undefined') return;

    // Try to use Capacitor Keyboard plugin for native coordination (if available)
    try {
        // Dynamic import to avoid errors if package is not installed
        import('@capacitor/keyboard').then(({ Keyboard }) => {
            Keyboard.addListener('keyboardWillShow', (info: { keyboardHeight: number }) => {
                console.log('Keyboard will show:', info.keyboardHeight);
                document.documentElement.style.setProperty(
                    '--keyboard-height',
                    `${info.keyboardHeight}px`
                );
                document.body.classList.add('keyboard-visible');
            });

            Keyboard.addListener('keyboardWillHide', () => {
                console.log('Keyboard will hide');
                document.documentElement.style.setProperty('--keyboard-height', '0px');
                document.body.classList.remove('keyboard-visible');
            });

            console.log('Capacitor Keyboard plugin initialized');
        }).catch(() => {
            console.warn('Capacitor Keyboard plugin not available, using fallback');
        });
    } catch (error) {
        console.warn('Capacitor Keyboard plugin not available, using fallback');
    }

    // Fallback to visualViewport API for web/PWA or additional coordination
    if (window.visualViewport) {
        const viewport = window.visualViewport;
        let lastHeight = viewport.height;

        const handleResize = () => {
            const currentHeight = viewport.height;
            const keyboardHeight = window.innerHeight - currentHeight;

            if (keyboardHeight > 100) {
                // Keyboard is visible
                console.log('Keyboard visible (visualViewport):', keyboardHeight);
                document.documentElement.style.setProperty(
                    '--keyboard-height',
                    `${keyboardHeight}px`
                );
                document.documentElement.style.setProperty(
                    '--viewport-height',
                    `${currentHeight}px`
                );
                document.body.classList.add('keyboard-visible');
            } else {
                // Keyboard is hidden
                console.log('Keyboard hidden (visualViewport)');
                document.documentElement.style.setProperty('--keyboard-height', '0px');
                document.documentElement.style.setProperty(
                    '--viewport-height',
                    `${window.innerHeight}px`
                );
                document.body.classList.remove('keyboard-visible');
            }

            lastHeight = currentHeight;
        };

        viewport.addEventListener('resize', handleResize);
        viewport.addEventListener('scroll', handleResize);

        // Initial call
        handleResize();

        return () => {
            viewport.removeEventListener('resize', handleResize);
            viewport.removeEventListener('scroll', handleResize);
        };
    }
}
