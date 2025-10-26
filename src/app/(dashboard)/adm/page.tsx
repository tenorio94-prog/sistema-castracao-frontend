import Home from "@/app/page";
import Link from 'next/link';

export default function AdminPage(){

return (
  <div>
    <h1 className=" text-2xl font-bold mb-4 text-green-700">Dashboard</h1>
    <p className= "text-green-800">Bem-vindo à seção de administração do painel.</p>
  </div>
);

}