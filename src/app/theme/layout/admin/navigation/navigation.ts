/**
 * Elemento del menú lateral. `roles` limita qué perfiles lo ven (la autorización real la hace el backend).
 */
export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  /** Roles que pueden ver el elemento; vacío o ausente = todos los autenticados. */
  roles?: string[];

  children?: NavigationItem[];
}
export const NavigationItems: NavigationItem[] = [
  {
    id: 'navigation',
    title: 'Inicio',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'grp-adm',
        title: 'Administración',
        type: 'collapse',
        icon: 'feather icon-settings',
        roles: ['ADMIN'],
        children: [
        {
          id: 'usuario',
          title: 'Gestión de Usuarios',
          type: 'item',
          url: '/inicio/usuarios',
          icon: 'feather icon-user',
          classes: 'nav-item',
          roles: ['ADMIN']
        },
        {
          id: 'especializacion',
          title: 'Especialidades',
          type: 'item',
          url: '/inicio/especializaciones',
          icon: 'feather icon-award',
          classes: 'nav-item',
          roles: ['ADMIN']
        },
        {
          id: 'tarifa',
          title: 'Tarifas',
          type: 'item',
          url: '/inicio/tarifas',
          icon: 'feather icon-tag',
          classes: 'nav-item',
          roles: ['ADMIN']
        },
        {
          id: 'horario',
          title: 'Horarios de veterinarios',
          type: 'item',
          url: '/inicio/horarios',
          icon: 'feather icon-clock',
          classes: 'nav-item',
          roles: ['ADMIN']
        },
        {
          id: 'raza',
          title: 'Gestión de Razas',
          type: 'item',
          url: '/inicio/razas',
          icon: 'feather icon-heart',
          classes: 'nav-item',
          roles: ['ADMIN']
        }
        ]
      },
      {
        id: 'grp-cli',
        title: 'Clientes y mascotas',
        type: 'collapse',
        icon: 'feather icon-users',
        roles: ['ADMIN', 'SECRETARIA'],
        children: [
        {
          id: 'cliente',
          title: 'Gestión de Clientes',
          type: 'item',
          url: '/inicio/clientes',
          icon: 'feather icon-users',
          classes: 'nav-item',
          roles: ['ADMIN', 'SECRETARIA']
        },
        {
          id: 'mascota',
          title: 'Gestión de Mascotas',
          type: 'item',
          url: '/inicio/mascotas',
          icon: 'feather icon-home',
          classes: 'nav-item',
          roles: ['ADMIN', 'SECRETARIA']
        }
        ]
      },
      {
        id: 'grp-cit',
        title: 'Citas',
        type: 'collapse',
        icon: 'feather icon-calendar',
        roles: ['ADMIN', 'SECRETARIA', 'MEDICO'],
        children: [
        {
          id: 'cita',
          title: 'Gestión de Citas',
          type: 'item',
          url: '/inicio/citas',
          icon: 'feather icon-calendar',
          classes: 'nav-item',
          roles: ['ADMIN', 'SECRETARIA']
        },
        {
          id: 'calendario',
          title: 'Mi calendario de citas',
          type: 'item',
          url: '/inicio/calendario',
          icon: 'feather icon-calendar',
          classes: 'nav-item',
          roles: ['MEDICO']
        }
        ]
      },
      {
        id: 'grp-cln',
        title: 'Atención clínica',
        type: 'collapse',
        icon: 'feather icon-activity',
        roles: ['ADMIN', 'MEDICO', 'SECRETARIA'],
        children: [
        {
          id: 'atencion',
          title: 'Atención médica',
          type: 'item',
          url: '/inicio/atencion-medica',
          icon: 'feather icon-activity',
          classes: 'nav-item',
          roles: ['ADMIN', 'MEDICO']
        },
        {
          id: 'historia-medica',
          title: 'Historias Médicas',
          type: 'item',
          url: '/inicio/historias-medicas',
          icon: 'feather icon-clipboard',
          classes: 'nav-item',
          roles: ['ADMIN', 'MEDICO', 'SECRETARIA']
        },
        {
          id: 'anotacion-historia',
          title: 'Anotaciones de historia',
          type: 'item',
          url: '/inicio/anotaciones',
          icon: 'feather icon-edit',
          classes: 'nav-item',
          roles: ['ADMIN', 'MEDICO']
        },
        {
          id: 'formula-medica',
          title: 'Fórmulas Médicas',
          type: 'item',
          url: '/inicio/formulas-medicas',
          icon: 'feather icon-file-text',
          classes: 'nav-item',
          roles: ['ADMIN', 'MEDICO']
        }
        ]
      },
      {
        id: 'grp-inv',
        title: 'Inventario y despacho',
        type: 'collapse',
        icon: 'feather icon-package',
        roles: ['ADMIN', 'DESPACHO_MEDICO'],
        children: [
        {
          id: 'inventario',
          title: 'Inventario',
          type: 'item',
          url: '/inicio/inventario',
          icon: 'feather icon-package',
          classes: 'nav-item',
          roles: ['ADMIN', 'DESPACHO_MEDICO']
        },
        {
          id: 'carga-masiva',
          title: 'Carga masiva de inventario',
          type: 'item',
          url: '/inicio/inventario/carga-masiva',
          icon: 'feather icon-upload',
          classes: 'nav-item',
          roles: ['ADMIN']
        },
        {
          id: 'despacho',
          title: 'Despacho de medicamentos',
          type: 'item',
          url: '/inicio/despacho',
          icon: 'feather icon-truck',
          classes: 'nav-item',
          roles: ['DESPACHO_MEDICO']
        }
        ]
      },
      {
        id: 'grp-fin',
        title: 'Facturación y reportes',
        type: 'collapse',
        icon: 'feather icon-credit-card',
        roles: ['ADMIN', 'SECRETARIA'],
        children: [
        {
          id: 'factura',
          title: 'Facturación',
          type: 'item',
          url: '/inicio/facturas',
          icon: 'feather icon-credit-card',
          classes: 'nav-item',
          roles: ['ADMIN', 'SECRETARIA']
        },
        {
          id: 'reporte',
          title: 'Reportes',
          type: 'item',
          url: '/inicio/reportes',
          icon: 'feather icon-bar-chart-2',
          classes: 'nav-item',
          roles: ['ADMIN']
        }
        ]
      }
    ]
  }
];
