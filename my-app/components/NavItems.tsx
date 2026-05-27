import Link from 'next/link'
import React from 'react'
import { callbackify } from 'util'

const NavItems = () => {
  return (
    <ul className="flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium">
      {NAV_ITEMS.map(({ href, title }) => (
        <li key={href}>
          <Link href={href} className="">
            {title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default NavItems
