/* Tooltip */
class Tooltip {
    #targetEl;
    #tooltipEl;
    #closeTimer;
    #observer;


    constructor(targetEl) {
        this.#targetEl = targetEl;

        this.#observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    this.#close()
                }
            });
        }, {
            root: null,
            threshold: 0
        });
    }

    #getElementOffsets() {
        const rect = this.#targetEl.getBoundingClientRect();
        let topOffset = rect.top + window.scrollY;
        let leftOffset = rect.left + window.scrollX;

        const halfWidth = this.#targetEl.offsetWidth / 2;

        return {
            topOffset: topOffset - (this.#tooltipEl.offsetHeight + 15),
            leftCenterOffset: (leftOffset + halfWidth) - (this.#tooltipEl.offsetWidth / 2)
        };
    }
   #makeTooltip(content) {
        const container = document.createElement('div');
        container.classList.add('tooltip');
        container.innerHTML = `
            <div class="tooltip__inner">
                <img src="img/check.svg" alt="checkmark">
                ${content}
            </div>
        `;

        return container;
    }

    #renderTooltip() {
        this.#tooltipEl.style.position = 'absolute';
        this.#tooltipEl.style.top = 0;
        this.#tooltipEl.style.zIndex = 100;
        this.#tooltipEl.style.opacity = 0;

        document.body.appendChild(this.#tooltipEl)
    }

    #moveToTarget() {
        const offsets = this.#getElementOffsets(this.#targetEl, this.#tooltipEl);

        this.#tooltipEl.style.transform = `translate3d(${offsets.leftCenterOffset}px, ${offsets.topOffset}px, 0)`;
    }

    #close() {
        if (this.#tooltipEl) {
            this.#tooltipEl.remove();
            clearTimeout(this.#closeTimer);
            this.#observer.unobserve(this.#targetEl);
        }
    }

    show(content, milliseconds = 2000) {
        this.#close();

        this.#tooltipEl = this.#makeTooltip(content);

        this.#renderTooltip()
        this.#moveToTarget();

        this.#tooltipEl.style.opacity = 1;

        this.#observer.observe(this.#targetEl)

        if(this.#closeTimer) clearTimeout(this.#closeTimer);
        this.#closeTimer = setTimeout(() => {
            this.#close();
        }, milliseconds)
    }
}

/* Tooltip */
class Toast {
    id;
    #open = false;
    #toastEl;

    constructor(element) {
        const id = element.getAttribute('data-toast');

        if (!id) throw Error(`Element hasn't data-toast attribute`);

        this.id = id;

        this.#makeToastElement(element)

        document.addEventListener('click', (e) => {
            if (this.#open && !e.target.closest(`[data-toast="${id}"]`)) {
                this.#close()
            };
        })

        document.addEventListener('toast:open', (e) => {
            if (e.detail.id !== this.id) this.#close()
        });

        window.addEventListener('resize', () => {
            if (this.#open) this.#close()
        })
    }

    #getElementOffsets(targetEl) {
        const rect = targetEl.getBoundingClientRect();
        let topOffset = rect.top + window.scrollY;
        let leftOffset = rect.left + window.scrollX;

        const halfWidth = targetEl.offsetWidth / 2;

        return {
            topOffset: topOffset + targetEl.offsetHeight + 15,
            leftCenterOffset: (leftOffset + halfWidth) - (this.#toastEl.offsetWidth / 2)
        };
    }

    #makeToastElement(element) {
        const close = document.createElement('button');
        close.classList.add('toast__close');
        close.innerHTML = `<img src="img/close.svg" alt="close">`;

        close.addEventListener('click', () => {
            this.#close();
        });

        element.prepend(close);

        document.body.appendChild(element);

        this.#toastEl = element;
    }

    #moveToTarget(targetEl) {
        const offsets = this.#getElementOffsets(targetEl, this.#toastEl);

        this.#toastEl.style.transform = `translate3d(${offsets.leftCenterOffset}px, ${offsets.topOffset}px, 0)`;
    }

    #close() {
        this.#toastEl.style.display = 'none';
        this.#open = false;
    }

    #isOpen() {
        return this.#open;
    }

    show(targetEl) {
        if (this.#isOpen()) return this.#close();

        this.#toastEl.style.position = 'absolute';
        this.#toastEl.style.display = 'block';
        this.#toastEl.style.top = 0;
        this.#toastEl.style.zIndex = 50;

        this.#moveToTarget(targetEl);

        this.#toastEl.style.opacity = 1;

        this.#open = true;

        document.dispatchEvent(new CustomEvent('toast:open', {
            detail: {
                id: this.id
            }
        }))
    }
}

document.querySelectorAll('.toast[data-toast]').forEach((el) => {
    const toast = new Toast(el);
    el.toast = toast;
})

document.querySelectorAll('[data-toast-open]').forEach((el) => {
    const toastId = el.getAttribute('data-toast-open');
    const toastEl = document.querySelector(`[data-toast="${toastId}"]`);

    if (toastEl) {
        el.addEventListener('click', (e) => {
            e.stopPropagation();

            toastEl.toast.show(el);
        })
    }
})

document.querySelectorAll('[data-copy-value]').forEach((el) => {
    const tooltip = new Tooltip(el);

    el.addEventListener('click', (e) => {
        const value = el.getAttribute('data-copy-value');
        if (value) {
            navigator.clipboard.writeText(value);

            tooltip.show('Code copied to clipboard.')
        }
    })
});

document.querySelector('[data-load-more-button]')?.addEventListener('click', () => {
    document.querySelector('[data-casino-list]')
        ?.querySelectorAll('.casino-card')
        ?.forEach(el => {
            el.classList.remove('hidden')
        })
})