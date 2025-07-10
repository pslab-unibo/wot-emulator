export class Property<T extends WoT.DataSchemaValue> {
    constructor(initialValue: T) {
        this.value = initialValue;
    }
    private value: T;
    private observer?: () => void

    public getValue = () => this.value;

    public setValue = (newValue: T) => {
        this.value = newValue;
        if(this.observer){
            this.observer();
        }
    };

    public observe = (observer: () => void) => {
        this.observer = observer;
    };

    public unobserve = () => {
        this.observer = undefined;
    }
}

