import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest { return { name:'BookStock Manager', short_name:'BookStock', description:'Multi-tenant bookstore inventory and sales management.', start_url:'/dashboard', display:'standalone', background_color:'#f7f2e8', theme_color:'#7a2438', icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml'}] }; }
