import {Component, Input, ViewChild} from '@angular/core';
import {Profile} from '../../../helpers/Profile';
import {PieMenu} from '../../../helpers/PieMenu';

@Component({
  selector: 'app-pie-menu-list',
  templateUrl: './pie-menu-list.component.html',
  styleUrls: ['./pie-menu-list.component.scss']
})
export class PieMenuListComponent {
  @Input() profId = 0;
  @ViewChild('pieMenuList') pieMenuList: any;

  tableEmpty = true;
  pieMenuPrefs: Array<PieMenu> = [];

  constructor() {
    const pieMenuIdList = Profile.getPieMenuIdList(this.profId);

    for (const id of pieMenuIdList) {
        this.pieMenuPrefs.push(new PieMenu('a', 'a', 'a'));
    }

  }

}
