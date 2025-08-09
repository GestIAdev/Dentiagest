def suma_joker(a, b):
    """
    🃏 Suma con actitud Joker: nada de matemáticas aburridas.
    
    Args:
        a (int/float): Primer número, preferiblemente con ganas de ser sumado.
        b (int/float): Segundo número, que no se haga el tímido.
    Returns:
        int/float: El resultado de la suma, con un toque de locura.
    Raises:
        TypeError: Si intentas sumar cosas que no son números, el Joker se enfada.
    """
    if not isinstance(a, (int, float)) or not isinstance(b, (int, float)):
        raise TypeError("¿En serio? ¡Solo números! No me hagas perder la sonrisa 🎭")
    resultado = a + b
    if resultado == 0:
        print("🎪 ¡Equilibrio perfecto! El caos y el orden se abrazan.")
    elif resultado < 0:
        print(f"🃏 ¡Oscuridad total! El resultado es negativo: {resultado}")
    elif resultado > 100:
        print(f"💥 ¡BOOM! Suma explosiva: {resultado}")
    else:
        print(f"😏 Suma completada: {resultado}")
    return resultado

if __name__ == "__main__":
    print("🃏 Bienvenido al show de la suma Joker 🃏")
    suma_joker(10, 5)
    suma_joker(-20, 10)
    suma_joker(50, 60)
    suma_joker(0, 0)
    try:
        suma_joker("hola", 5)
    except TypeError as e:
        print(f"Error capturado: {e}")
