import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ProductForm } from '../product-form/product-form';
import { Title } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';


interface ProductData {
    _id?: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    description: string;
}


@Component({
    selector: 'app-products',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        HttpClientModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
    ],
    templateUrl: './products.html',
    styleUrls: ['./products.css']
})


export class ProductsComponent implements OnInit {
    products: ProductData[] = [];
    totalProducts = 0;
    currentPage = 1;
    isLoggedIn = false;

    search = '';
    category = '';
    brand = '';
    sort = '';
    limit: number = 15;

    brands: string[] = [];

    private authSubscription?: Subscription;

    constructor(
        private dialog: MatDialog,
        private titleService: Title,
        private http: HttpClient,
        private authService: AuthService
    ) {}


    ngOnInit(): void {
        this.titleService.setTitle('Stuff & Things - Termékek');

        this.authSubscription = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
            this.isLoggedIn = isLoggedIn;
            if (this.isLoggedIn) {
                this.loadProducts();
            } else {
                this.products = [];
                this.brands = [];
            }
        });
    }


    ngOnDestroy(): void {
        this.authSubscription?.unsubscribe();
    }


    loadProducts(): void {
        if (!this.isLoggedIn) {
            this.products = [];
            this.brands = [];
            return;
        }

        const params = new HttpParams()
            .set('search', this.search)
            .set('category', this.category)
            .set('brand', this.brand)
            .set('sort', this.sort)
            .set('limit', this.limit.toString())
            .set('page', this.currentPage.toString());

        this.http.get<{ total: number, products: ProductData[] }>('http://localhost:3000/api/products', { params }).subscribe({
            next: (data) => {
                this.products = data.products;
                this.totalProducts = data.total;

                const brandSet = new Set<string>();
                this.products.forEach(p => {
                    if (p.brand) {
                        brandSet.add(p.brand);
                    }
                });
                this.brands = Array.from(brandSet).sort();
            },
            error: (err) => {
                console.error('Hiba a termékek betöltésekor:', err);
            }
        });
    }


    get totalPages(): number {
        return Math.ceil(this.totalProducts / this.limit);
    }


    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadProducts();
        }
    }


    addProduct(): void {
        const dialogRef = this.dialog.open(ProductForm, {
            width: '400px',
            data: {
                name: '',
                brand: '',
                category: '',
                price: 0,
                description: ''
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.http.post<{ id: string }>('http://localhost:3000/api/products', result).subscribe({
                    next: () => this.loadProducts(),
                    error: (err) => console.error('Hiba termék hozzáadásakor:', err)
                });
            }
        });
    }


    editProduct(product: ProductData): void {
        const dialogRef = this.dialog.open(ProductForm, {
            width: '400px',
            data: { ...product }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && product._id) {
                this.http.put(`http://localhost:3000/api/products/${product._id}`, result).subscribe({
                    next: () => this.loadProducts(),
                    error: (err) => console.error('Hiba termék módosításakor:', err)
                });
            }
        });
    }


    deleteProduct(product: ProductData): void {
        if (product._id && confirm('Biztosan törlöd ezt a terméket?')) {
            this.http.delete(`http://localhost:3000/api/products/${product._id}`).subscribe({
                next: () => this.loadProducts(),
                error: (err) => console.error('Hiba termék törlésekor:', err)
            });
        }
    }
}
