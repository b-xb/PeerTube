import { CommonModule } from '@angular/common'
import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core'
import { NavigationEnd, Router, RouterModule } from '@angular/router'
import { GlobalIconComponent, GlobalIconName } from '@app/shared/shared-icons/global-icon.component'
import { logger } from '@root-helpers/logger'
import { filter, Subscription } from 'rxjs'
import { PluginSelectorDirective } from '../plugins/plugin-selector.directive'
import { ListOverflowComponent } from './list-overflow.component'

export type HorizontalMenuEntry = {
  label: string
  iconName?: GlobalIconName

  routerLink: string
  queryParams?: Record<string, any>

  isDisplayed?: () => boolean // Default: () => true
  pluginSelectorId?: string // Default: () => true

  children?: {
    label: string

    routerLink: string
    queryParams?: Record<string, any>

    isDisplayed?: () => boolean // Default: () => true
  }[]
}

@Component({
  selector: 'my-horizontal-menu',
  templateUrl: './horizontal-menu.component.html',
  styleUrls: [ './horizontal-menu.component.scss' ],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListOverflowComponent,
    GlobalIconComponent,
    PluginSelectorDirective
  ]
})
export class HorizontalMenuComponent implements OnInit, OnChanges, OnDestroy {
  @Input() menuEntries: HorizontalMenuEntry[] = []

  @Input() h1: string
  @Input() h1Icon: GlobalIconName

  activeParent: HorizontalMenuEntry
  children: HorizontalMenuEntry[] = []

  private routerSub: Subscription

  constructor (private router: Router) {

  }

  ngOnInit () {
    this.routerSub = this.router.events.pipe(
      filter((event: any) => event instanceof NavigationEnd)
    ).subscribe(() => this.buildChildren())
  }

  ngOnChanges () {
    this.buildChildren()
  }

  ngOnDestroy () {
    if (this.routerSub) this.routerSub.unsubscribe()
  }

  private buildChildren () {
    this.children = []
    this.activeParent = undefined

    const currentUrl = window.location.pathname
    const entry = this.menuEntries.find(parent => {
      if (currentUrl.startsWith(parent.routerLink)) return true

      if (parent.children) return parent.children.some(child => currentUrl.startsWith(child.routerLink))

      return false
    })

    if (!entry) {
      if (this.menuEntries.length !== 0) {
        logger.info(`Unable to find entry for ${currentUrl}`, { menuEntries: this.menuEntries })
      }

      return
    }

    this.children = entry.children
    this.activeParent = entry
  }
}
