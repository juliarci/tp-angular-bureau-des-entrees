import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatBadgeModule } from '@angular/material/badge';

interface NavItem {
  label: string;
  route: string;
  badge?: number;
  badgeColor?: 'red' | 'blue';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatBadgeModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class AppSidebarComponent {
  sections: NavSection[] = [
    {
      title: 'PILOTAGE',
      items: [
        { label: 'Tableau de bord', route: '/dashboard' },
        { label: 'Admissions du jour', route: '/admissions', badge: 47, badgeColor: 'blue' }
      ]
    },
    {
      title: 'PATIENTS',
      items: [
        { label: 'Recherche patient', route: '/patients/search' },
        { label: 'Fiche patient', route: '/patients/record' },
        { label: 'Nouvelle admission', route: '/patients/new-admission' },
      ]
    },
  ];
}
