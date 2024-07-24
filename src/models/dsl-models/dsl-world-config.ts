export interface IDslWorldConfig {    
    
}

export class DslWorldConfig implements IDslWorldConfig {

    constructor(config: Partial<IDslWorldConfig>) {
        Object.assign(this, config);
    }
}