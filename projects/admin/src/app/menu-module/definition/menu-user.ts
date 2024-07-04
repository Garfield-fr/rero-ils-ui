/*
 * RERO ILS UI
 * Copyright (C) 2024 RERO
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { MenuItem } from "primeng/api";
import { MENU_IDS } from "./menu-ids";

export const MENU_USER: MenuItem[] = [
  {
    label: 'Help',
    translateLabel: 'Help',
    icon: 'pi pi-question',
    id: MENU_IDS.USER.HELP,
    url: '/help',
  },
  {
    label: '$symbolName',
    translateLabel: '$symbolName',
    icon: 'pi pi-user',
    id: MENU_IDS.USER.MENU,
    items: [
      {
        label: 'Language',
        translateLabel: 'Language',
        icon: 'pi pi-language',
        id: MENU_IDS.USER.LANGUAGE,
        items: [],
      },
      {
        label: 'Public interface',
        translateLabel: 'Public interface',
        icon: 'pi pi-users',
        id: MENU_IDS.USER.PUBLIC_INTERFACE,
        url: '/',
        target: '_self',
      },
      {
        label: 'Logout',
        translateLabel: 'Logout',
        icon: 'pi pi-sign-out',
        id: MENU_IDS.USER.LOGOUT,
        url: '/signout',
        target: '_self',
        command: () => {},
      },
    ],
  }
]
