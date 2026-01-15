import { Routes } from '@angular/router';
import { Routes as ROUTES } from 'src/shared/config/routes';
import { AppPagesComponent } from './providers/PageProvider/app-pages/app-pages.component';
import { AuthGuard } from './providers/Guards/auth.guard';
import { SeoGuard } from './providers/Guards/seo.guard';
import { AdminPagesComponent } from './providers/PageProvider/admin-pages';
import { SuperAdminGuard } from './providers/Guards/super-admin.guard';

export const appRoutes: Routes = [
  {
    path: '',
    component: AppPagesComponent,
    children: [
      {
        path: ROUTES.HOME,
        loadComponent: () => import('src/pages/home-page').then((m) => m.HomePageComponent),
      },
      {
        path: ROUTES.CATALOG,
        loadComponent: () => import('src/pages/catalog-page').then((m) => m.CatalogPageComponent),
      },
      {
        path: ROUTES.ABOUT,
        loadComponent: () => import('src/pages/about-page').then((m) => m.AboutPageComponent),
      },
      {
        path: ROUTES.DISCOUNTS,
        loadComponent: () =>
          import('src/pages/discounts-page').then((m) => m.DiscountsPageComponent),
      },
      {
        path: ROUTES.CALCULATOR,
        loadComponent: () =>
          import('src/pages/calculator-page').then((m) => m.CalculatorPageComponent),
        data: { hideUI: true },
      },
      {
        path: ROUTES.REVIEWS,
        loadComponent: () => import('src/pages/reviews-page').then((m) => m.ReviewsPageComponent),
      },
      {
        path: ROUTES.CONTACTS,
        loadComponent: () => import('src/pages/contacts-page').then((m) => m.ContactsPageComponent),
      },
      {
        path: ROUTES.INNOVATIONS,
        loadComponent: () =>
          import('src/pages/innovations-page').then((m) => m.InnovationsPageComponent),
      },
      {
        path: ROUTES.NEWS,
        loadComponent: () => import('src/pages/news-page').then((m) => m.NewsPageComponent),
      },
      {
        path: ROUTES.PHOTOGALLERY,
        loadComponent: () =>
          import('src/pages/photogallery-page').then((m) => m.PhotogalleryPageComponent),
      },
      {
        path: ROUTES.COOPERATION,
        loadComponent: () =>
          import('src/pages/cooperation-page').then((m) => m.CooperationPageComponent),
      },
      {
        path: ROUTES.DEALERS,
        loadComponent: () => import('src/pages/dealers-page').then((m) => m.DealersPageComponent),
      },
      {
        path: ROUTES.LOGIN_FOR_ADMIN,
        loadComponent: () =>
          import('src/pages/admin/admin-login-page').then((m) => m.AdminLoginPageComponent),
      },
    ],
  },
  {
    path: ROUTES.ADMIN,
    canActivate: [AuthGuard],
    component: AdminPagesComponent,
    children: [
      {
        path: '',
        redirectTo: ROUTES.ADMIN_MAIN,
        pathMatch: 'full',
      },
      {
        path: ROUTES.ADMIN_MAIN,
        loadComponent: () =>
          import('src/pages/admin/admin-main-page').then((m) => m.AdminMainPageComponent),
        children: [
          {
            path: ROUTES.ADMIN_PANEL_PRODUCTS,
            loadComponent: () =>
              import('src/features/ProductPanel').then((m) => m.ProductPanelComponent),
          },
          {
            path: ROUTES.ADMIN_PANEL_CATEGORIES,
            loadComponent: () =>
              import('src/features/CategoryPanel').then((m) => m.CategoryPanelComponent),
          },
          {
            path: ROUTES.ADMIN_PANEL_MATERIALS,
            loadComponent: () =>
              import('src/features/MaterialPanel').then((m) => m.MaterialPanelComponent),
          },
          {
            path: ROUTES.ADMIN_PANEL_EDGES,
            loadComponent: () =>
              import('src/features/EdgePanel').then((m) => m.EdgePanelComponent),
          },
          {
            path: ROUTES.ADMIN_PANEL_COLORS,
            loadComponent: () =>
              import('src/features/ColorPanel').then((m) => m.ColorPanelComponent),
          },
          {
            path: ROUTES.ADMIN_PANEL_ACTIONS,
            loadComponent: () =>
              import('src/features/ActionssPanel').then((m) => m.ActionssPanelComponent),
          },
          {
            path: ROUTES.ADMIN_PANEL_FASTENERS,
            loadComponent: () =>
              import('src/features/FastenersPanel').then((m) => m.FastenersPanelComponent),
          },
          {
            path: ROUTES.ADMIN_PANEL_FURNITURES,
            loadComponent: () =>
              import('src/features/FurniturePanel').then((m) => m.FurniturePanelComponent),
          },
          {
            path: ROUTES.ADMIN_PANEL_SERIES,
            loadComponent: () =>
              import('src/features/SeriesPanel').then((m) => m.SeriesPanelComponent),
          },
          {
            path: ROUTES.ADMIN_PANEL_TYPES,
            loadComponent: () =>
              import('src/features/TypesPanel').then((m) => m.TypesPanelComponent),
          },
          {
            path: ROUTES.ADMIN_PANEL_SPECIFICATIONS,
            loadComponent: () =>
              import('src/features/SpecificationPanel').then((m) => m.SpecificationPanelComponent),
          },
          {
            path: ROUTES.ADMIN_PANEL_MILLINGS,
            loadComponent: () =>
              import('src/features/MillingPanel').then((m) => m.MillingPanelComponent),
          },
          {
            path: ROUTES.ADMIN_PANEL_NEWS,
            loadComponent: () => import('src/features/NewsPanel').then((m) => m.NewsPanelComponent),
          },
          {
            path: ROUTES.ADMIN_PANEL_COMBINE_MATERIALS,
            loadComponent: () =>
              import('src/features/CombineMaterialPanel').then((m) => m.CombineMaterialPanelComponent),
          },
        ],
      },
      {
        path: ROUTES.ADMIN_PANEL_CATEGORIES,
        loadComponent: () =>
          import('src/features/CategoryPanel').then((m) => m.CategoryPanelComponent),
      },
      {
        path: ROUTES.ADMIN_PANEL_MATERIALS,
        loadComponent: () =>
          import('src/features/MaterialPanel').then((m) => m.MaterialPanelComponent),
      },
      {
        path: ROUTES.ADMIN_SUPER,
        loadComponent: () =>
          import('src/pages/admin/admin-super-page').then((m) => m.AdminSuperPageComponent),
        canActivate: [SuperAdminGuard],
        children: [
          {
            path: ROUTES.ADMIN_PANEL_GRIDS,
            loadComponent: () => import('src/features/GridPanel').then((m) => m.GridPanelComponent),
          },
        ],
      },
      {
        path: ROUTES.ADMIN_PROFILE,
        loadComponent: () =>
          import('src/pages/admin/admin-profile-page').then((m) => m.AdminProfilePageComponent),
      },
      {
        path: ROUTES.ADMIN_BASE,
        loadComponent: () =>
          import('src/pages/admin/admin-base-page').then((m) => m.AdminBasePageComponent),
      },
      {
        path: ROUTES.ADMIN_SEO,
        canActivate: [SeoGuard],
        loadComponent: () =>
          import('src/pages/admin/admin-seo-page').then((m) => m.AdminSeoPageComponent),
      },
      {
        path: ROUTES.ADMIN_USERS,
        loadComponent: () =>
          import('src/pages/admin/admin-users-page').then((m) => m.AdminUsersPageComponent),
      },
      {
        path: ROUTES.ADMIN_HISTORY,
        loadComponent: () =>
          import('src/pages/admin/admin-history-page').then((m) => m.AdminHistoryPageComponent),
      },
    ],
  },
];
