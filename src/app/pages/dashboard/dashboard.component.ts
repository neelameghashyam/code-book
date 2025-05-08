import { Component, inject } from '@angular/core';
import { DarkModeService } from '../../services/dark-mode.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  public darkModeService = inject(DarkModeService);

}
