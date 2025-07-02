import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';


@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule
    ],
    templateUrl: './contact.html',
    styleUrls: ['./contact.css']
})


export class ContactComponent implements OnInit {
    constructor(private titleService: Title) {}

    ngOnInit(): void {
        this.titleService.setTitle('Stuff & Things - Elérhetőségek');
    }
}
