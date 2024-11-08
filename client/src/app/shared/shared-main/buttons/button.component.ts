import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common'
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, ViewChild, booleanAttribute } from '@angular/core'
import { RouterLink } from '@angular/router'
import { GlobalIconName } from '@app/shared/shared-icons/global-icon.component'
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap'
import { GlobalIconComponent } from '../../shared-icons/global-icon.component'
import { LoaderComponent } from '../common/loader.component'

@Component({
  selector: 'my-button',
  styleUrls: [ './button.component.scss' ],
  templateUrl: './button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ NgIf, NgClass, NgbTooltip, NgTemplateOutlet, RouterLink, LoaderComponent, GlobalIconComponent ]
})

export class ButtonComponent implements OnChanges, AfterViewInit {
  @Input() label = ''
  @Input() theme: 'orange' | 'grey' | 'primary' | 'secondary' = 'grey'
  @Input() icon: GlobalIconName
  @Input() ptRouterLink: string[] | string
  @Input() title: string
  @Input({ transform: booleanAttribute }) loading = false
  @Input({ transform: booleanAttribute }) disabled = false
  @Input({ transform: booleanAttribute }) responsiveLabel = false

  @ViewChild('labelContent') labelContent: ElementRef

  classes: { [id: string]: boolean } = {}

  ngOnChanges () {
    this.buildClasses()
  }

  ngAfterViewInit () {
    this.buildClasses()
  }

  private buildClasses () {
    this.classes = {
      'peertube-button': !this.ptRouterLink,
      'peertube-button-link': !!this.ptRouterLink,
      'orange-button': this.theme === 'orange',
      'grey-button': this.theme === 'grey',
      'primary-button': this.theme === 'primary',
      'secondary-button': this.theme === 'secondary',
      'has-icon': !!this.icon,
      'icon-only': !(this.labelContent?.nativeElement as HTMLElement)?.innerText,
      'responsive-label': this.responsiveLabel
    }
  }
}
