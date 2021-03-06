import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Pizza } from '../models/pizza.ts';

@Injectable()
export class PizzaService {
    constructor(private http: Http) { }

    private pizzasUrl = 'https://pizza-backend.herokuapp.com/pizzas';

    getPizzas() {
        return this.http.get(this.pizzasUrl)
            .toPromise()
            .then((resp) => resp.json())
            .catch(this.handleError);
    }

    getPizza(id: number) {
        return this.getPizzas()
            .then((pizzas) => pizzas.find(pizza => pizza.id === id));
    }

    save(pizza: Pizza): Promise<Pizza> {
        if (pizza.id) {
            return this.put(pizza);
        }
        return this.post(pizza);
    }

    destroy(pizza: Pizza) {
        if (pizza.id) {
            return this.http.delete(`${this.pizzasUrl}/${pizza.id}`)
                .toPromise()
                .catch(this.handleError);
        }

        return new Promise((resolve) => resolve());
    }

    advanceStatus(pizza: Pizza) {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        return this.http.patch(`${this.pizzasUrl}/${pizza.id}/advanceStatus`, undefined, { headers })
            .toPromise()
            .then((resp) => resp.json())
            .catch(this.handleError);
    }

    private post(pizza: Pizza): Promise<Pizza> {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const toppings = this.getToppingIds(pizza);
        const pizzaData = this.filterProps(pizza);
        return this.http
                .post(this.pizzasUrl, JSON.stringify({ pizza: pizzaData, toppings }), { headers })
                .toPromise()
                .then((resp) => resp.json())
                .catch(this.handleError);
    }

    private put(pizza: Pizza): Promise<Pizza> {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const url = `${this.pizzasUrl}/${pizza.id}`;
        const toppings = this.getToppingIds(pizza);
        const pizzaData = this.filterProps(pizza);
        return this.http
                .put(url, JSON.stringify({ pizza: pizzaData, toppings }), { headers })
                .toPromise()
                .then((resp) => resp.json())
                .catch(this.handleError);
    }

    private handleError(error: any) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }

    private getToppingIds(pizza: Pizza): Array<number> {
        if (!pizza.toppings) {
            return [];
        }

        return pizza.toppings.map((t) => t.id);
    }

    private filterProps(pizza: Pizza): Object {
        return { name: pizza.name };
    }
}
