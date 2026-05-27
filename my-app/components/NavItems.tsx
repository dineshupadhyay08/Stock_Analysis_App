import Link from 'next/link'
import React from 'react'
import { callbackify } from 'util'

const NavItems = () => {
  return (
    <ul className="flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium">
      {NAV_ITEMS.map(({ href, label }) => (
        <li key={href}>
          <Link href={href} className="">
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default NavItems
