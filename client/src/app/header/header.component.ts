import { CommonModule, ViewportScroller } from '@angular/common'
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import {
  AuthService,
  AuthStatus,
  AuthUser,
  HotkeysService,
  MenuService,
  RedirectService,
  ScreenService,
  ServerService,
  UserService
} from '@app/core'
import { NotificationDropdownComponent } from '@app/header/notification-dropdown.component'
import { scrollToTop } from '@app/helpers'
import { LanguageChooserComponent } from '@app/menu/language-chooser.component'
import { QuickSettingsModalComponent } from '@app/menu/quick-settings-modal.component'
import { ActorAvatarComponent } from '@app/shared/shared-actor-image/actor-avatar.component'
import { InputSwitchComponent } from '@app/shared/shared-forms/input-switch.component'
import { PeertubeModalService } from '@app/shared/shared-main/peertube-modal/peertube-modal.service'
import { LoginLinkComponent } from '@app/shared/shared-main/users/login-link.component'
import { SignupLabelComponent } from '@app/shared/shared-main/users/signup-label.component'
import { NgbDropdown, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'
import { ServerConfig } from '@peertube/peertube-models'
import { Subscription } from 'rxjs'
import { GlobalIconComponent } from '../shared/shared-icons/global-icon.component'
import { ButtonComponent } from '../shared/shared-main/buttons/button.component'
import { SearchTypeaheadComponent } from './search-typeahead.component'

@Component({
  selector: 'my-header',
  templateUrl: './header.component.html',
  styleUrls: [ './header.component.scss' ],
  standalone: true,
  imports: [
    CommonModule,
    NotificationDropdownComponent,
    ActorAvatarComponent,
    InputSwitchComponent,
    SignupLabelComponent,
    LoginLinkComponent,
    LanguageChooserComponent,
    QuickSettingsModalComponent,
    GlobalIconComponent,
    RouterLink,
    NgbDropdownModule,
    SearchTypeaheadComponent,
    RouterLink,
    GlobalIconComponent,
    ButtonComponent
  ]
})

export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('languageChooserModal', { static: true }) languageChooserModal: LanguageChooserComponent
  @ViewChild('quickSettingsModal', { static: true }) quickSettingsModal: QuickSettingsModalComponent
  @ViewChild('dropdown') dropdown: NgbDropdown

  user: AuthUser
  loggedIn: boolean

  hotkeysHelpVisible = false

  currentInterfaceLanguage: string

  loaded = false

  private serverConfig: ServerConfig

  private quickSettingsModalSub: Subscription
  private hotkeysSub: Subscription
  private authSub: Subscription

  constructor (
    private viewportScroller: ViewportScroller,
    private authService: AuthService,
    private userService: UserService,
    private serverService: ServerService,
    private redirectService: RedirectService,
    private hotkeysService: HotkeysService,
    private screenService: ScreenService,
    private menuService: MenuService,
    private modalService: PeertubeModalService,
    private router: Router
  ) { }

  get isInMobileView () {
    return this.screenService.isInMobileView()
  }

  get language () {
    return this.languageChooserModal.getCurrentLanguage()
  }

  get requiresApproval () {
    return this.serverConfig.signup.requiresApproval
  }

  get instanceName () {
    return this.serverConfig.instance.name
  }

  ngOnInit () {
    this.currentInterfaceLanguage = this.languageChooserModal.getCurrentLanguage()

    this.loggedIn = this.authService.isLoggedIn()
    this.updateUserState()

    this.authSub = this.authService.loginChangedSource.subscribe(status => {
      if (status === AuthStatus.LoggedIn) {
        this.loggedIn = true
      } else if (status === AuthStatus.LoggedOut) {
        this.loggedIn = false
      }

      this.updateUserState()
    })

    this.hotkeysSub = this.hotkeysService.cheatSheetToggle
      .subscribe(isOpen => this.hotkeysHelpVisible = isOpen)

    this.serverService.getConfig()
      .subscribe(config => this.serverConfig = config)

    this.quickSettingsModalSub = this.modalService.openQuickSettingsSubject
      .subscribe(() => this.openQuickSettings())

    this.loaded = true
  }

  ngOnDestroy () {
    if (this.quickSettingsModalSub) this.quickSettingsModalSub.unsubscribe()
    if (this.hotkeysSub) this.hotkeysSub.unsubscribe()
    if (this.authSub) this.authSub.unsubscribe()
  }

  // ---------------------------------------------------------------------------

  getDefaultRoute () {
    return this.redirectService.getDefaultRoute().split('?')[0]
  }

  getDefaultRouteQuery () {
    return this.router.parseUrl(this.redirectService.getDefaultRoute()).queryParams
  }

  // ---------------------------------------------------------------------------

  isRegistrationAllowed () {
    if (!this.serverConfig) return false

    return this.serverConfig.signup.allowed &&
      this.serverConfig.signup.allowedForCurrentIP
  }

  logout (event: Event) {
    event.preventDefault()

    this.authService.logout()
    // Redirect to home page
    this.redirectService.redirectToHomepage()
  }

  openLanguageChooser () {
    this.languageChooserModal.show()
  }

  openQuickSettings () {
    this.quickSettingsModal.show()
  }

  // FIXME: needed?
  onDropdownOpenChange (opened: boolean) {
    if (this.screenService.isInMobileView()) return

    // Close dropdown when window scroll to avoid dropdown quick jump for re-position
    const onWindowScroll = () => {
      this.dropdown?.close()
      window.removeEventListener('scroll', onWindowScroll)
    }

    if (opened) {
      window.addEventListener('scroll', onWindowScroll)
      document.querySelector('nav').scrollTo(0, 0) // Reset menu scroll to easy lock
      // eslint-disable-next-line @typescript-eslint/unbound-method
      document.querySelector('nav').addEventListener('scroll', this.onMenuScrollEvent)
    } else {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      document.querySelector('nav').removeEventListener('scroll', this.onMenuScrollEvent)
    }
  }

  // Lock menu scroll when menu scroll to avoid fleeing / detached dropdown
  // FIXME: needed?
  onMenuScrollEvent () {
    document.querySelector('nav').scrollTo(0, 0)
  }

  // FIXME: needed?
  onActiveLinkScrollToAnchor (link: HTMLAnchorElement) {
    const linkURL = link.getAttribute('href')
    const linkHash = link.getAttribute('fragment')

    // On same url without fragment restore top scroll position
    if (!linkHash && this.router.url.includes(linkURL)) {
      scrollToTop('smooth')
    }

    // On same url with fragment restore anchor scroll position
    if (linkHash && this.router.url === linkURL) {
      this.viewportScroller.scrollToAnchor(linkHash)
    }

    if (this.screenService.isInSmallView()) {
      this.menuService.toggleMenu()
    }
  }

  openHotkeysCheatSheet () {
    this.hotkeysService.cheatSheetToggle.next(!this.hotkeysHelpVisible)
  }

  private updateUserState () {
    this.user = this.loggedIn
      ? this.authService.getUser()
      : undefined
  }
}
