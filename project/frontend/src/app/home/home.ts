import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Title } from '@angular/platform-browser';


@Component({
    selector: 'app-home',
    standalone: true,
    imports: [MatCardModule],
    templateUrl: './home.html',
    styleUrls: ['./home.css']
})


export class HomeComponent implements OnInit {
    constructor(private titleService: Title) {}

    ngOnInit(): void {
        this.titleService.setTitle('Stuff & Things - Főoldal');
    }
}
