import Navigation from "../Navigation";

export default function NavigationExample() {
  return (
    <Navigation
      user={null}
      onLogout={() => console.log("Logout clicked")}
    />
  );
}
